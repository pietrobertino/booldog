import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <section className="bg_404_img">
            <div className="container">

            <div className="row g-5 py-5">
                <div className="col-lg-6 d-flex flex-column justify-content-center text-center text-lg-start">
                    <span className="eyebrow text-body-secondary d-block mb-3">
                        Errore 404
                    </span>
                    <h1 className="headline mb-4">
                        Questa pagina
                        <br />
                        <em>è scappata.</em>
                    </h1>
                    <p className="fs-5 mb-4 fw-medium">
                        Sembra che la pagina che stavi cercando si sia nascosta sotto al divano.
                        Torna alla home e riprova.
                    </p>
                    <Link
                        to="/"
                        className="btn btn-dark rounded-pill px-4 py-3 btn_cart gap-2 "
                    >
                        <i className="bi bi-arrow-left pe-2"></i>
                        Torna alla home
                    </Link>
                </div>
            </div>
            </div>
        </section>
    );
}
