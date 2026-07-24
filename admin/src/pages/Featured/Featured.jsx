import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Featured.css';

const MAX_FEATURED_DISHES = 4;

const Featured = ({ url }) => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response?.data?.success) {
        setFoods(response.data.data || []);
      } else {
        toast.error(response?.data?.message || 'Failed to load dishes');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dishes');
    } finally {
      setLoading(false);
    }
  };

  const featuredCount = useMemo(
    () => foods.filter((dish) => dish.isFeatured).length,
    [foods]
  );

  const sortedFoods = useMemo(() => {
    const dishes = [...foods];
    dishes.sort((a, b) => {
      if (a.isFeatured === b.isFeatured) return a.name.localeCompare(b.name);
      return a.isFeatured ? -1 : 1;
    });
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
    fetchFoods();
  }, []);

  return (
    <section className="featured-page add">
      <div className="featured-header">
        <div>
          <p className="featured-kicker">Home spotlight</p>
          <h2>Weekly featured dishes</h2>
          <p>
            Pick up to {MAX_FEATURED_DISHES} dishes for the home page. All dishes remain in the main menu database.
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
                  {dish.isFeatured ? 'Remove from Home' : 'Set as Home Featured'}
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
