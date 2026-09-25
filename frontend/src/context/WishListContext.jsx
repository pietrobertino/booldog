import { createContext, useContext, useState, useEffect } from "react";

const WishListContext = createContext();

export function WishListContextProvider({ children }) {

  const wishlistArr = [];

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wish_data");
    return saved ? JSON.parse(saved) : wishlistArr;
  });

  useEffect(() => {
    localStorage.setItem("wish_data", JSON.stringify(wishlist));
    /* localStorage.clear()  */
  }, [wishlist]);


  // verifico se il prodotto esiste nel carrello
  const isInWishList = (slug) => wishlist.find((item) => item.slug === slug);


  // funzione aggiungi wishlist
  const addToWishList = (product) => {

    // se esiste al click lo rimuovo
    if (isInWishList(product.slug)) {
      const updatedWishList = wishlist.filter((item) => item.slug !== product.slug);
      setWishlist(updatedWishList);
    } else {
      // altrimenti lo aggiungo
      setWishlist([...wishlist, { ...product }]);
    }
  };


  return (
    <WishListContext.Provider value={{
      wishlist,
      setWishlist,
      addToWishList,
      isInWishList
    }}>
      {children}
    </WishListContext.Provider>
  );

}

export function useWishlist() {

  const context = useContext(WishListContext);

  return context;
}

//
