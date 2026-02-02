import UnderConstruction from "~/components/UnderConstruction";
import Image from "next/image"; 

import devdog from "public/images/devdog.png"; 
import blob1 from "public/blobs/blob1.svg"; 
import blob2 from "public/blobs/blob2.svg"; 

export default async function HomePage() {
  return (
    <div className="m-0 p-0 relative overflow-x-hidden">
      <div className="m-4 lg:m-10 h-[90vh] isolate flex flex-col-reverse justify-around items-center lg:flex-row">
        <Image src={blob1} alt="background blob" className="absolute w-full h-full translate-x-145 -translate-y-5 rotate-10 -z-10 fill-[radial-gradient(circle_at_center,#ba0c2f,#dccbcb,#e4002b)]"/> 
        <Image src={blob2} alt="background blob" className="absolute w-full h-full -translate-x-165 translate-y-80 -rotate-50 -z-10 fill-[radial-gradient(circle_at_center,#ba0c2f,#dccbcb,#e4002b)]" /> 

        <p className="font-display text-6xl text-semibold lg:text-8xl">Welcome to <br /><span className="text-punchy-pink font-bold">DevDogs</span>!</p>
        <Image src={devdog} alt="DevDogs Logo" className="h-auto w-full sm:h-96 sm:w-auto" /> 
      </div> 
    </div>
  );
}
