import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = () => {
    const { food_list } = useContext(StoreContext)

    const featured = food_list.filter((dish) => dish.isFeatured).slice(0, 4)

    return (
        <section className="food-display" id="food-display">
            <div className="food-display-header">
                <p className="eyebrow">This week</p>
                <h2 className="food-display-title">Featured dishes.</h2>
                <p className="food-display-subtext">
                    A short list, chosen by the chef. Available while the produce lasts.
                </p>
            </div>

            <div className="food-display-grid">
                {featured.length === 0 ? (
                    <div className="featured-empty-state">
                        No featured dishes selected this week yet. Check back soon.
                    </div>
                ) : (
                    featured.map((item) => (
                        <FoodItem
                            key={item._id}
                            id={item._id}
                            name={item.name}
                            price={item.price}
                            description={item.description}
                            image={item.image}
                        />
                    ))
                )}
            </div>
        </section>
    )
}

export default FoodDisplay

// import React, { useContext } from 'react'
// import './FoodDisplay.css'
// import { StoreContext } from '../../context/StoreContext'
// import FoodItem from '../FoodItem/FoodItem'

// //find out what this does and why we use it

// const FoodDisplay = ({category}) => {

//     const {food_list} = useContext(StoreContext);


//   return (
//     <div className='food-display' id='food-display'>
//       <h2>Top dishes near you</h2>
//       <div className="food-display-list">
//         {food_list.map((item,index) => {
//           if (category === 'all' || item.category === category) {
//             return <FoodItem key={index} id={item._id} name={item.name} price={item.price} description={item.description} image={item.image}/>

//           }
//         })}
//       </div>

//     </div>
//   )
// }

// export default FoodDisplay
