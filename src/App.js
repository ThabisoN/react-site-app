import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import  { Home }  from './components/home';
import  { AboutUs }  from './components/AboutUs';
import  { Blog } from'./components/blog';
import  { ContactUs } from'./components/ContactUs';
import  { Education } from './components/education';
import  { Services } from './components/Services';
import  { Work } from './components/work';
import{BrowserRouter, Router, Route, Switch, NavLink, Routes} from 'react-router-dom'

import { Experience } from './components/experience';
import { Skills } from './components/skills';

function App() {
  return (
    <BrowserRouter>
<div className='App container'>
      <h3 className='d-flex justify-content-center m-3'>
       My Site
      </h3>

      <nav className="navbar navbar-expand-sm bg-light navbar-dark">
        <ul className='navbar-nav'>
        <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/home">
             Home
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/AboutUs">
             About Us
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/Services">
              Services
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/skills">
              Skills
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/education">
              Education
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/experience">
              Experience
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/work">
              Work
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/blog">
              Blog
            </NavLink>
          </li>
          <li className='nav-item- m-1'>
            <NavLink className="btn btn=light btn-outline-primary" to="/ContactUs">
              Contact Us
            </NavLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path='/home' element={<Home />} />
        <Route path='/AboutUs' element={<AboutUs />} />
        <Route path='/Services' element={<Services />} />
        <Route path='/skills' element={<Skills />} />
        <Route path='/education' element={<Education />}/>
        <Route path='/experience' element={<Experience />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/work' element={<Work />}/>
        <Route path='/ContactUs' element={<ContactUs />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
