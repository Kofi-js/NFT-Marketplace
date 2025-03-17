import { Box, Flex, Text } from "@radix-ui/themes";
import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const Footer = () => {
    return (
        <footer className="bg-white py-8 mt-12 border-t border-gray-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                                <Icon icon="ri:nft-fill" className="w-5 h-5" />
                            </div>
                            <Text className="font-bold text-xl text-gray-900">NFT Marketplace</Text>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Discover, collect, and sell extraordinary NFTs on our digital marketplace.
                        </p>
                    </div>
                    
                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Marketplace</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li><a href="#" className="hover:text-primary transition-colors">All NFTs</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Art</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Collectibles</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Photography</a></li>
                        </ul>
                    </div>
                    
                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Partners</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Newsletter</a></li>
                        </ul>
                    </div>
                    
                    {/* Join Newsletter */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Stay in the loop</h3>
                        <p className="text-gray-600 text-sm mb-4">Join our mailing list to stay in the loop with our newest feature releases and NFT drops.</p>
                        <div className="flex">
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary flex-grow text-sm"
                            />
                            <button className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary-dark transition-colors">
                                <Icon icon="ri:send-plane-fill" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Bottom section */}
                <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-600 text-sm">
                        © 2023 NFT Marketplace. All rights reserved.
                    </div>
                    
                    {/* Social links */}
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                            <Icon icon="ri:twitter-x-fill" className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                            <Icon icon="ri:instagram-line" className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                            <Icon icon="ri:discord-fill" className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                            <Icon icon="ri:github-fill" className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
