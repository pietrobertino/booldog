import { useGlobal } from "../context/CartContext"

export default function Overlay() {

    const { setAsideCart, setAsideNav } = useGlobal()

    return (

        <div onClick={() => { setAsideCart(false); setAsideNav(false); }} className="overlay bg-body-secondary position-fixed start-0 end-0 top-0 bottom-0 z-2 cursor-pointer" ></div >

    )

}