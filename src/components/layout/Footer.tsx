
import React from 'react';
import { Link } from 'react-router-dom';
import logodatacareer from '../../../public/logoDataCareer.png';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center">
                <img src={logodatacareer} alt="DataCareer App Logo" className="h-10 w-auto" />
              </Link>
            </div>
            <p className="text-gray-500 mt-2 text-sm">
              Practice SQL interview questions from top companies
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {/* <div className="w-32">
              <h3 className="text-sm font-semibold text-datacareer-darkBlue mb-2">Product</h3>
              <ul className="space-y-1">
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">Questions</Link></li>
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">Companies</Link></li>
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">Solutions</Link></li>
              </ul>
            </div> */}

            {/* <div className="w-32">
              <h3 className="text-sm font-semibold text-datacareer-darkBlue mb-2">Company</h3>
              <ul className="space-y-1">
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">About</Link></li>
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">Privacy</Link></li>
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">Terms</Link></li>
              </ul>
            </div> */}
            {/*             
            <div className="w-32">
              <h3 className="text-sm font-semibold text-datacareer-darkBlue mb-2">Support</h3>
              <ul className="space-y-1">
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">FAQ</Link></li>
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">Contact</Link></li>
                <li><Link to="/" className="text-sm text-gray-500 hover:text-datacareer-orange">Feedback</Link></li>
              </ul>
            </div> */}
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Datacareer.app. All rights reserved.
        </div>
        <div className="border-gray-200 mt-2 pt-2 text-center text-xs text-gray-500">
          This MVP Module is Designed and Developed with ❤️ by Techifyhouse.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
