'use client'
import Link from 'next/link'; 
import GlobeIcon from '@/assets/globe.svg'; 

export default function Navbar() {
  return (
    <header className="topNavigation"> 
        <Link href="/">
            <GlobeIcon 
              width={32} 
              height={32} 
              className="logo"
            />
        </Link>   
        <div className="wrapper">
            <div className="theme-icons"> 
                icons display here
            </div>
            <div className="loginbutton/userprofile"></div>
        </div>
    </header>
  );
}

