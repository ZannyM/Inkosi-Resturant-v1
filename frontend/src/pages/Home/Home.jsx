import React from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import ServiceHighlights from '../../components/ServiceHighlights/ServiceHighlights'

const Home = () => {
  return (
    <div className='home-page'>
        <Header/>
        <FoodDisplay/>
        <ServiceHighlights/>
      
    </div>
  )
}
  
export default Home
