import { Link } from "react-router-dom";
import Carlo from "../assets/team/Carlo.png";
import Odon from "../assets/team/Odon.jpg";
import Antonio from "../assets/team/Antonio.png";
import Nabil from "../assets/team/Nabil.png";
import Pietro from "../assets/team/Pietro.png";

export default function ChiSiamoPage() {
    return (
        <div className="container mt-5 mb-5">
            <div className="card rounded-4 p-4 bg-paper">
                <div className="d-flex justify-content-start align-items-center m-3">
                    <Link to="/">
                        <button className="btn btn-dark rounded-pill border-0 btn_cart">
                            <i className="bi bi-arrow-left-short"></i>Torna alla Home
                        </button>
                    </Link>
                </div>
                <h3 className="cart-hero mt-3 mb-5 d-flex justify-content-center">
                    <span className="d-block">
                        Chi
                    </span>
                    <em className="d-block">Siamo</em>
                </h3>
                <div className="text-center">
                    <p>
                        Chi ha un cane o un gatto lo sa bene: non sono animali domestici. Sono compagni di vita.
                    </p>
                    <p>
                        BoolDog nasce da questa consapevolezza. Abbiamo cercato tra centinaia di marchi quelli che condividono la nostra stessa idea di qualità, materiali sicuri, lavorazioni curate, prodotti pensati per durare e li abbiamo riuniti in un unico posto.
                    </p>
                    <p>
                        Troverai ciò che abbiamo scelto, con la stessa attenzione che riserveresti al tuo animale. Perché il nostro lavoro non è venderti qualcosa, è farti trovare la cosa giusta.
                    </p>
                    <hr />
                    <p>
                        Dietro BoolDog c'è un team piccolo e selettivo, proprio come la nostra scelta di prodotti.
                    </p>
                    <p>
                        Amiamo gli animali, conosciamo i brand e sappiamo riconoscere la qualità quando la vediamo.
                    </p>
                    <div className="row row-cols-1 row-cols-md-5 mt-5">
                        <div className="col mt-2">
                            <div className="card card_team">
                                <img src={Carlo} className="card-img-top img_team img_no_hover" alt="Carlo" />
                                <div className="card-body">
                                    <h5 className="card-title">Carlo Falagna</h5>
                                    <p className="card-text">Team member</p>
                                </div>
                            </div>
                        </div>
                        <div className="col mt-2">
                            <div className="card card_team">
                                <img src={Odon} className="card-img-top img_team img_no_hover" alt="Odon" />
                                <div className="card-body">
                                    <h5 className="card-title">Odon Airoldi</h5>
                                    <p className="card-text">Team member</p>
                                </div>
                            </div>
                        </div>
                        <div className="col mt-2">
                            <div className="card card_team">
                                <img src={Antonio} className="card-img-top img_team img_no_hover" alt="Antonio" />
                                <div className="card-body">
                                    <h5 className="card-title">Antonio Falletta</h5>
                                    <p className="card-text">Team member</p>
                                </div>
                            </div>
                        </div>
                        <div className="col mt-2">
                            <div className="card card_team">
                                <img src={Nabil} className="card-img-top img_team img_no_hover" alt="Nabil" />
                                <div className="card-body">
                                    <h5 className="card-title">Nabil Hajali</h5>
                                    <p className="card-text">Team member</p>
                                </div>
                            </div>
                        </div>
                         <div className="col mt-2">
                            <div className="card card_team">
                                <img src={Pietro} className="card-img-top img_team img_no_hover" alt="Pietro" />
                                <div className="card-body">
                                    <h5 className="card-title">Pietro Bertino</h5>
                                    <p className="card-text">Team member</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


            </div>
        </div>


    )
}