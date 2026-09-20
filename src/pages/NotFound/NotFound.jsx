import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="screen">
      <h1>404</h1>
      <p>Esta ruta no existe.</p>
      <Link className="btn" to="/">Volver al inicio</Link>
    </section>
  )
}

export default NotFound
