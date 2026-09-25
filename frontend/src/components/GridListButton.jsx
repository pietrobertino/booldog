export default function GridListButton({ setListView }) {

    return (
        <>
            <div className="rounded-pill bg-paper border d-flex">
                <button className='btn border-0 p-2' onClick={() => setListView(true)}><i className="bi bi-grid d-flex"></i></button>
                <button className='btn border-0 p-2' onClick={() => setListView(false)}><i className="bi bi-list d-flex"></i></button>
            </div>
        </>
    )
}