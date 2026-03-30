"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"

export function SharedHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-6 lg:px-10">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <img 
                src="https://assets.macaly-user-data.dev/cdn-cgi/image/format=webp,width=2000,height=2000,fit=scale-down,quality=90,anim=true/n9vqtt1eze5iybbawq57tn30/new-chat/4nxzs5XXRQ3yhBbM5utid/logo-orange-black.png"
                alt="Logo"
                className="w-auto h-9"
              />
            </Link>
          </div>

          {/* Navigation */}
          <Navigation />
        </div>
      </div>
    </header>
  )
}





