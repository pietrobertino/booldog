import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useGlobal } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import SideCart from "../components/SideCart";
import WishListButton from "../components/WishListButton";

export default function ProductPage() {
  const {
    cart,
    setCart,
    asideCart,
    setAsideCart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    productQuantity,
    setProductQuantity,
  } = useGlobal();

  const [dataProduct, setDataProduct] = useState(null);

  const { slug } = useParams();

  useEffect(() => {
    setProductQuantity(1);
    axios
      .get(`http://localhost:3000/products/${slug}`)
      .then((res) => setDataProduct(res.data));
  }, [slug]);

  // controllo se questo prodotto è già nel carrello e con che quantità
  const existingInCart = cart.find((p) => p.id === dataProduct?.id);
  const quantityInCart = existingInCart ? existingInCart.quantity : 0;

  // quanti pezzi può ancora aggiungere l'utente al carrello
  const stock = dataProduct?.stock ?? 0;
  const remainingStock = stock - quantityInCart;

  // disabilito il "+" se la prossima aggiunta supererebbe lo stock
  const isPlusDisabled = productQuantity >= remainingStock;

  // disabilito "Aggiungi al carrello" se non c'è più stock disponibile
  const isAddDisabled = remainingStock <= 0;

  return (
    <section>
      <div className="container-lg py-3">
        {dataProduct && (
          <div>
            <div className="row">
              <div className="col-10 col-md-5 col-lg-6 offset-1 offset-md-0">
                <div className="ratio ratio-1x1">
                  <div className="d-flex align-items-center justify-content-center">
                    <WishListButton product={dataProduct} slug={slug} />
                    <img
                      className="w-100 h-100 object-fit-contain"
                      src={`http://localhost:3000/images/products/${dataProduct.img_url}`}
                      alt={dataProduct.name}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-7 col-lg-6 d-flex align-items-center justify-content-center">
                <div className="px-lg-5">
                  <div className="cart-meta mb-3">
                    {dataProduct.animal_name} / {dataProduct.category}
                  </div>
                  <h1 className="display-3 lh-1 fw-normal">
                    {dataProduct.name}
                  </h1>
                  <p>{dataProduct.description}</p>
                  <div className="cart-meta mb-4">
                    <div className="mb-1">Marca <span className="text-black">{dataProduct.brand_name}</span></div>
                    <div className="mb-1">Taglia <span className="text-black">{dataProduct.size}</span></div>
                    <div className="mb-1">Colore <span className="text-black">{dataProduct.color}</span></div>
                    <div className="mb-1">Materiale <span className="text-black">{dataProduct.material}</span></div>
                  </div>
                  <div className="border-top py-4">
                    <p className="h1 mb-0 lh-1">{dataProduct.price} €</p>
                  </div>
                  {dataProduct.stock === 0 ? <div className="border-top py-4">
                    <p className="cart-meta mb-0 esaurito_product">Esaurito</p>
                  </div> : (dataProduct === 1 ? <div className="border-top py-4">
                    <p className="cart-meta mb-0">{dataProduct.stock} prodotto disponibile</p>
                  </div> : <div className="border-top py-4">
                    <p className="cart-meta mb-0">{dataProduct.stock} prodotti disponibili</p>
                  </div>)}


                  <div className="row gx-2">
                    <div className="col-auto">
                      <div className="quantity-controls rounded-pill bg-paper border d-flex">
                        <button
                          onClick={decreaseQuantity}
                          type="button"
                          disabled={productQuantity <= 1}
                          className="btn p-3 border-0"
                        >
                          <i className="bi bi-dash d-flex"></i>
                        </button>
                        <div className="d-flex align-items-center justify-content-center">
                          <span className="small">{productQuantity}</span>
                        </div>
                        <button
                          onClick={() =>
                            increaseQuantity(dataProduct.stock, quantityInCart)
                          }
                          type="button"
                          disabled={isPlusDisabled}
                          className="btn p-3 border-0"
                        >
                          <i className="bi bi-plus d-flex"></i>
                        </button>
                      </div>
                    </div>
                    <div className="col">
                      <button
                        onClick={() => addToCart(dataProduct, productQuantity)}
                        disabled={isAddDisabled}
                        className="btn btn-dark w-100 p-3 lh-1 rounded-pill border-0"
                      >
                        {
                          stock === 0
                            ? "Esaurito"
                            : remainingStock <= 0
                              ? "Hai aggiunto tutti i prodotti disponibili"
                              : "Aggiungi al carrello"
                        }

                      </button>
                    </div>
                    {productQuantity && cart.length > 0 && (
                      <span className=" mt-1 already-present d-block">
                        {quantityInCart} articolo/i nel tuo carrello.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="py-5">
              <h3>Prodotti correlati</h3>
              <div className="row g-2 g-lg-3 g-xl-4">
                {dataProduct.related.map((product) => (
                  <div className="col-12 col-sm-6 col-md-4 col-xl-3" key={product.slug}>
                    <ProductCard
                      product={product}
                      addToCart={() => addToCart(product, 1)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
