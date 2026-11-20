import './ServiceHighlights.css'
import food4 from '../../assets/food_4.png'
import food8 from '../../assets/food_8.png'
import food20 from '../../assets/food_20.png'

const highlights = [
  {
    title: 'Easy checkout',
    text: 'A fast, secure, and hassle-free checkout every time.',
    image: food4,
  },
  {
    title: 'Reliable delivery',
    text: 'Fresh orders packed with care and delivered on time.',
    image: food8,
  },
  {
    title: 'Customer support',
    text: 'Here to help before, during, and after your order.',
    image: food20,
  },
]

const ServiceHighlights = () => {
  return (
    <section className="service-highlights" id="service-highlights">
      <div className="service-highlights-inner">
        <div className="service-highlights-heading">
          <p className="eyebrow">Why Inkosi</p>
          <h2 className="service-highlights-title">Service highlights.</h2>
        </div>

        {highlights.map((item) => (
          <article key={item.title} className="service-card">
            <img src={item.image} alt="" className="service-card-image" />
            <div className="service-card-label">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ServiceHighlights
