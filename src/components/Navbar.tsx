import * as NavigationMenu from "@radix-ui/react-navigation-menu"; 
import Link from "next/link"; 
import Image from "next/image"; 
import { getSession } from "~/server/auth";


import devdog from "~/assets/devdog.png"; 

export default async function Navbar() {
    const session = await getSession({
        user: {
            with: { github: true, publicProfile: true },
        },
    });

    return (
        <NavigationMenu.Root className="sticky top-0 z-50 w-full bg-linear-to-r from-punchy-pink to-[#e4002b]">
            <NavigationMenu.List className="center mx-2 my-0 p-6 flex justify-center items-center gap-5 list-none">
                <NavigationMenu.Item className="group mr-auto px-4 py-3 text-xl font-display font-bold text-white bg-none rounded-lg transition-all ease-in-out duration-200" asChild>
                    <Link href="/">
                        <Image src={devdog} alt="DevDogs Logo" className="inline h-10 w-auto mr-4 group-hover:scale-125 group-hover:rotate-5 transition-all ease-in-out duration-200 lg:h-8" /> 
                        <p className="hidden lg:inline">DevDogs</p>
                    </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item className="px-4 py-3 text-md font-display font-bold text-white bg-none hover:bg-white/20 rounded-lg transition-all ease-in-out duration-200" asChild>
                    <Link href="/community">
                        Community
                    </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item className="px-4 py-3 text-md font-display font-bold text-white bg-none hover:bg-white/20 rounded-lg transition-all ease-in-out duration-200" asChild>
                    <Link href="/projects">
                        Projects
                    </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item className="px-4 py-3 text-md font-display font-bold text-white bg-none hover:bg-white/20 rounded-lg transition-all ease-in-out duration-200" asChild>
                    <Link href="/events">
                        Events
                    </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item className="px-4 py-3 text-md font-display font-bold text-white bg-none hover:bg-white/20 rounded-lg transition-all ease-in-out duration-200" asChild>
                    <Link href="/partners">
                        Partners
                    </Link>
                </NavigationMenu.Item>
                <NavigationMenu.Item className="ml-auto px-4 py-3 text-md font-display font-bold text-white bg-white/15 hover:bg-white/30 rounded-lg transition-all ease-in-out duration-200" asChild>
                    <Link href="/join">
                        Join Us
                    </Link>
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    ); 
}