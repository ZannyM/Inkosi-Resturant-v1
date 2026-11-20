import { useEffect, useMemo, useState } from 'react';
import axios from '../../auth/api';
import { toast } from 'react-toastify';
import './Featured.css';

const MAX_FEATURED_DISHES = 4;

const loadFoods = async (url) => {
  const response = await axios.get(`${url}/api/food/featured`);
  if (!response?.data?.success) {
    throw new Error(response?.data?.message || 'Failed to load dishes');
  }
  return response.data.data || [];
};

const Featured = ({ url }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      setFoods(await loadFoods(url));
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  const featuredCount = foods.length;

  const sortedFoods = useMemo(() => {
    const dishes = [...foods];
    dishes.sort((a, b) => a.name.localeCompare(b.name));
    return dishes;
  }, [foods]);

  const toggleFeatured = async (dish) => {
    if (!dish.isFeatured && featuredCount >= MAX_FEATURED_DISHES) {
      toast.error(`You can only feature ${MAX_FEATURED_DISHES} dishes at once.`);
      return;
    }

    try {
      const response = await axios.post(`${url}/api/food/feature`, {
        id: dish._id,
        isFeatured: !dish.isFeatured
      });

      if (response?.data?.success) {
        toast.success(response.data.message);
        fetchFoods();
      } else {
        toast.error(response?.data?.message || 'Failed to update featured dishes');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update featured dishes');
    }
  };

  useEffect(() => {
    let active = true;
    loadFoods(url).then((data) => {
      if (active) setFoods(data);
    }).catch((error) => {
      if (!active) return;
      console.error(error);
      toast.error(error.message || 'Failed to load dishes');
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [url]);

  return (
    <section className="featured-page add">
      <div className="featured-header">
        <div>
          <p className="featured-kicker">Home spotlight</p>
          <h2>Weekly featured dishes</h2>
          <p>
            Showing only the selected featured dishes for the home page.
          </p>
        </div>
        <div className="featured-counter">
          {featuredCount}/{MAX_FEATURED_DISHES} selected
        </div>
      </div>

      {loading ? (
        <p className="featured-loading">Loading dishes...</p>
      ) : (
        <div className="featured-grid">
          {sortedFoods.length === 0 && (
            <p className="featured-loading">No featured dishes selected yet.</p>
          )}
          {sortedFoods.map((dish) => (
            <article key={dish._id} className={`featured-card ${dish.isFeatured ? 'active' : ''}`}>
              <img src={`${url}/images/${dish.image}`} alt={dish.name} />
              <div className="featured-card-body">
                <div className="featured-card-topline">
                  <h3>{dish.name}</h3>
                  <span className={`featured-tag ${dish.isFeatured ? 'active' : ''}`}>
                    {dish.isFeatured ? 'Featured' : 'Standard'}
                  </span>
                </div>
                <p className="featured-card-meta">{dish.category} • R{dish.price}</p>
                <button
                  type="button"
                  onClick={() => toggleFeatured(dish)}
                  className={`featured-toggle-btn ${dish.isFeatured ? 'remove' : 'add'}`}
                >
                  Remove from Home
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Featured;
