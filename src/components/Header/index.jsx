import { Box, Flex, Text } from "@radix-ui/themes";
import React, { useState } from "react";
import WalletConnection from "./WalletConnection";
import { Icon } from "@iconify/react/dist/iconify.js";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Flex
            as="header"
            className="bg-gradient-primary sticky top-0 z-50 shadow-md"
            style={{ padding: "0.75rem 1.5rem" }}
        >
            <div className="container mx-auto flex items-center justify-between">
                {/* Logo */}
                <Flex align="center" gap="2">
                    <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden animate-float">
                        <Icon 
                            icon="ri:nft-fill" 
                            className="w-6 h-6 text-primary" 
                        />
                    </div>
                    <Text
                        className="text-white font-bold text-2xl tracking-tight"
                        as="h1"
                    >
                        <span className="hidden sm:inline">NFT</span> Marketplace
                    </Text>
                </Flex>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-2">
                    <a href="#" className="px-4 py-2 text-white/80 hover:text-white transition-colors">
                        Explore
                    </a>
                    <a href="#" className="px-4 py-2 text-white/80 hover:text-white transition-colors">
                        Collections
                    </a>
                    <a href="#" className="px-4 py-2 text-white/80 hover:text-white transition-colors">
                        About
                    </a>
                    <div className="ml-4">
                        <WalletConnection />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <WalletConnection />
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-white p-2 rounded-lg focus:outline-none"
                    >
                        <Icon icon={isMenuOpen ? "ri:close-line" : "ri:menu-line"} className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden z-50 py-4 px-6 flex flex-col gap-3 border-t border-gray-100">
                    <a href="#" className="px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                        <Icon icon="ri:compass-line" className="w-5 h-5" />
                        Explore
                    </a>
                    <a href="#" className="px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                        <Icon icon="ri:gallery-line" className="w-5 h-5" />
                        Collections
                    </a>
                    <a href="#" className="px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                        <Icon icon="ri:information-line" className="w-5 h-5" />
                        About
                    </a>
                </div>
            )}
        </Flex>
    );
};

export default Header;
