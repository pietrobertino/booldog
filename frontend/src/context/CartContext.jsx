import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const CartContext = createContext();


export function CartContextProvider({ children }) {

  const location = useLocation();

  // aside cart
  const [asideCart, setAsideCart] = useState(false);

  // aside nav
  const [asideNav, setAsideNav] = useState(false);

  useEffect(() => {
    setAsideCart(false)
    setAsideNav(false)
  }, [location.pathname])

  useEffect(() => {
    if (asideCart) {
      document.body.classList.add("overflow-hidden", "aside-cart-open");
    } else {
      document.body.classList.remove("overflow-hidden", "aside-cart-open");
    }
  }, [asideCart]);

  useEffect(() => {
    if (asideNav) {
      document.body.classList.add("overflow-hidden", "aside-nav-open");
    } else {
      document.body.classList.remove("overflow-hidden", "aside-nav-open");
    }
  }, [asideNav]);

  // cart
  const cartArr = [];

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart_data");
    return saved ? JSON.parse(saved) : cartArr;
  });


  useEffect(() => {
    localStorage.setItem("cart_data", JSON.stringify(cart));
    /* localStorage.clear()  */
  }, [cart]);


  const [productQuantity, setProductQuantity] = useState(1);

  // aumento quantità da aggiungere al carrello tenendo conto
  // sia dello stock disponibile sia di quanti pezzi sono già nel carrello
  const increaseQuantity = (stock, quantityInCart = 0) => {
    // se stock non è un numero non blocco l'utente (fallback)
    const maxStock = typeof stock === "number" ? stock : Infinity;

    if (productQuantity + quantityInCart < maxStock) {
      setProductQuantity(productQuantity + 1);
    }
  };

  // diminuisco quantità da aggiungere al carrello se maggiore di 1
  const decreaseQuantity = () => {
    if (productQuantity > 1) {
      setProductQuantity(productQuantity - 1);
    }
  };


  // funzione aggiungi al carrello
  const addToCart = (item, quantity) => {
    // se stock non è un numero uso Infinity come fallback (non blocca l'aggiunta)
    const stock = typeof item.stock === "number" ? item.stock : Infinity;

    // se lo stock è 0 (o negativo) non aggiungo proprio il prodotto al carrello
    if (stock <= 0) {
      return;
    }

    // verifico se il prodotto esiste nel carrello
    const existingProduct = cart.find((product) => product.id === item.id);

    // se esiste aggiorno la quantità del prodotto esistente
    if (existingProduct) {
      // se ho già tutti i pezzi disponibili non aggiorno
      if (existingProduct.quantity >= stock) {
        return;
      }

      const updatedCart = cart.map((product) => {
        if (product.id === item.id) {
          // sommo la quantità nuova a quella già nel carrello
          const newQuantity = product.quantity + quantity;
          // ma non supero mai lo stock disponibile
          const finalQuantity = Math.min(newQuantity, stock);
          return { ...product, quantity: finalQuantity };
        }
        return product;
      });
      setCart(updatedCart);
      // se non esiste aggiungo il nuovo prodotto (sempre limitato dallo stock)
    } else {
      const safeQuantity = Math.min(quantity, stock);
      setCart([...cart, { ...item, quantity: safeQuantity }]);
    }

    /* setAsideCart(true); */
    setProductQuantity(1);
  };



  // Calcolo del totale del carrello in base alla quantita'
  const total = cart.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  );

  // Aggiorna la quantita' del prodotto nel carrello (+1 o -1)
  const updateQuantity = (slug, amount) => {
    const updated = cart.map((item) => {
      if (item.slug !== slug) return item;

      // calcolo la nuova quantità
      const newQty = item.quantity + amount;

      // se non conosco lo stock uso Infinity (non blocco l'utente)
      const maxStock = typeof item.stock === "number" ? item.stock : Infinity;

      // la quantità deve stare tra 1 e lo stock disponibile
      const safeQty = Math.max(1, Math.min(newQty, maxStock));

      return { ...item, quantity: safeQty };
    });

    setCart(updated);
    localStorage.setItem("cart_data", JSON.stringify(updated));
  };

  // Rimuove il prodotto dal carrello
  const removeFromCart = (slug) => {
    const updated = cart.filter((item) => item.slug !== slug);
    setCart(updated);
    localStorage.setItem("cart_data", JSON.stringify(updated));
  };

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      total,
      updateQuantity,
      removeFromCart,
      asideCart,
      setAsideCart,
      setAsideNav,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      productQuantity,
      setProductQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(CartContext);

  return context;
}

//
