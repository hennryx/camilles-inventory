import React from 'react'

const Home = ({ handleToggle=()=> {} }) => {

    return (

        <div className="relative isolate px-6 pt-14 lg:px-8">
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                />
            </div>

            <div className="text-center  py-32 sm:py-48 lg:py-56">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    Prince Nazareth Hotel
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet
                    fugiat veniam occaecat fugiat aliqua.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <div
                        className="rounded-md bg-indigo-200 px-3.5 py-2.5 text-base font-semibold text-indigo-800 shadow-sm hover:bg-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => handleToggle("login", true)}
                    >
                        Get started
                    </div>
                </div>
            </div>

            <div
                className="w-full overflow-x-scroll md:overflow-x-hidden px-4 pb-4 bg-whiteCard"
            >
                <h1 className='text-5xl font-bold text-start'>Rooms</h1>
                <p>Explore our room categories: Whether you're looking for the ultimate luxury in our VIP rooms, a premium experience in our suite rooms, a comfortable stay in our family rooms, or a cozy retreat in our regular accommodations, we have the perfect room to suit your needs and make your stay unforgettable.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 my-6">
                </div>
            </div>

        </div>
    )
}

export default Home