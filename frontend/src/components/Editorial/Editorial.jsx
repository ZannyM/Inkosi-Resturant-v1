import React from 'react';
import './Editorial.css';

const Editorial = () => {
  return (
    <section className="editorial-strip">
      <div className="editorial-content">
        <p className="eyebrow">Our kitchen</p>
        <blockquote className="editorial-quote">
          "We cook the way we'd cook for someone staying the night —
          <em className="text-gold"> a little longer than needed,</em> with
          the good olive oil, the right music."
        </blockquote>
        <p className="eyebrow">— Chef Elena Rousseau</p>
      </div>
    </section>
  );
};

export default Editorial;