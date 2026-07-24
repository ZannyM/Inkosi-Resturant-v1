import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import Editorial from '../../components/Editorial/Editorial'

const Home = () => {
  //please look up why we add this line of code
  const [category, setCategory] = useState('all');

  return (
    <div className='home-page'>
        <Header/>
        <ExploreMenu category={category} setCategory={setCategory}/>
        <FoodDisplay category={category}/>
        <Editorial/>
      
    </div>
  )
}
  
export default Home
