import { useCallback, useEffect, useState } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../services/operations/authAPI";

import { NavbarLinks } from "../../../data/navbar-links";
import studyNotionLogo from "../../assets/Logo/Logo-Full-Light.png";
import { fetchCourseCategories } from "./../../services/operations/courseDetailsAPI";

import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);
  const location = useLocation();

  const [subLinks, setSubLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSublinks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchCourseCategories()
      setSubLinks(res)
    } catch (error) {
      console.log("Could not fetch the category list = ", error)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSublinks();
  }, [fetchSublinks]);

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleSignup = () => {
    navigate("/signup");
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 z-[1000] flex h-14 w-full items-center justify-center border-b-[1px] border-b-richblack-700 bg-richblack-900/50 backdrop-blur-md text-white"
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">
        <Link to="/" aria-label="Home">
          <img
            src={studyNotionLogo}
            width={120}
            height={30}
            loading="lazy"
            alt="StudyNotion Logo"
          />
        </Link>

        {/* Hamburger menu button - visible on small screens */}
        <button
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          className="sm:hidden flex flex-col h-6 w-6 justify-between items-center group"
        >
          <span
            className={`h-0.5 w-full bg-white rounded-lg transform transition duration-300 ease-in-out ${
              mobileMenuOpen ? "rotate-45 translate-y-2.5" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full bg-white rounded-lg transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`h-0.5 w-full bg-white rounded-lg transform transition duration-300 ease-in-out ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2.5" : ""
            }`}
          />
        </button>

        {/* Nav Links - visible for only large devices */}
        <ul className="hidden sm:flex gap-x-6 text-richblack-25">
          {NavbarLinks.map((link, index) => (
            <li key={index}>
              {link.title === "Catalog" ? (
                <div
                  className={`group relative flex cursor-pointer items-center gap-1 ${
                    matchRoute("/catalog/:catalogName")
                      ? "bg-yellow-25 text-black rounded-xl p-1 px-3"
                      : "text-richblack-25 rounded-xl p-1 px-3"
                  }`}
                >
                  <p>{link.title}</p>
                  <MdKeyboardArrowDown />
                  <div
                    className="invisible absolute left-[50%] top-[50%] z-[1001] flex w-[200px] translate-x-[-50%] translate-y-[3em] 
                    flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible 
                    group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px]"
                  >
                    <div className="absolute left-[50%] top-0 z-[100] h-6 w-6 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-5"></div>
                    {loading ? (<p className="text-center">Loading...</p>)
                      : subLinks.length ? (
                        <>
                          {subLinks?.map((subLink, i) => (
                            <Link
                              to={`/catalog/${subLink.name.split(" ").join("-").toLowerCase()}`}
                              className="rounded-lg bg-transparent py-4 pl-4 hover:bg-richblack-50"
                              key={i}
                            >
                              <p>{subLink.name}</p>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <p className="text-center">No Courses Found</p>
                      )}
                  </div>
                </div>
              ) : (
                <Link to={link?.path}>
                  <p
                    className={`${
                      matchRoute(link?.path)
                        ? "bg-yellow-25 text-black"
                        : "text-richblack-25"
                    } rounded-xl p-1 px-3`}
                  >
                    {link.title}
                  </p>
                </Link>
              )}
            </li>
          ))}

          {/* Free Courses Link */}
          <li>
            <Link to="/free-courses">
              <p className={`${
                matchRoute("/free-courses")
                  ? "bg-yellow-25 text-black"
                  : "text-richblack-25"
              } rounded-xl p-1 px-3`}>
                Free Courses
              </p>
            </Link>
          </li>

          {/* Services Dropdown */}
          <li>
            <div className={`group relative flex cursor-pointer items-center gap-1 ${
              matchRoute("/services/institute") || matchRoute("/services/student")
                ? "bg-yellow-25 text-black rounded-xl p-1 px-3"
                : "text-richblack-25 rounded-xl p-1 px-3"
            }`}>
              <p>Services</p>
              <MdKeyboardArrowDown />
              <div className="invisible absolute left-[50%] top-[50%] z-[1001] flex w-[200px] -translate-x-1/2 translate-y-[3em] flex-col rounded-lg bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[250px]">
                <div className="absolute left-[50%] top-0 z-[100] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 select-none rounded bg-richblack-5"></div>
                <Link
                  to="/services/institute"
                  className="rounded-lg bg-transparent py-2 px-3 hover:bg-richblack-50"
                >
                  For Institute
                </Link>
                <Link
                  to="/services/student"
                  className="rounded-lg bg-transparent py-2 px-3 hover:bg-richblack-50"
                >
                  For Student
                </Link>
              </div>
            </div>
          </li>

          {/* Auth Buttons - Show only when user is not logged in */}
          {!token && (
            <>
              <li>
                <button 
                  onClick={handleLogin}
                  className="rounded-[8px] border border-richblack-700 bg-richblack-800 px-[12px] py-[8px] text-richblack-100"
                >
                  Log in
                </button>
              </li>
              <li>
                <button 
                  onClick={handleSignup}
                  className="rounded-[8px] bg-yellow-50 px-[12px] py-[8px] text-richblack-900"
                >
                  Sign up
                </button>
              </li>
            </>
          )}

          {/* User Profile Picture with Dropdown */}
          {token && user && (
            <li className="relative ml-4 flex items-center group">
              <img
                src={user.image}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-10 w-10 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-yellow-50"
                title={`${user.firstName} ${user.lastName}`}
              />
              {/* Dropdown Menu */}
              <div className="invisible absolute right-0 top-[120%] z-[1000] flex w-[200px] flex-col rounded-lg bg-richblack-800 p-4 text-richblack-25 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="absolute right-4 top-0 h-6 w-6 rotate-45 translate-y-[-50%] select-none rounded bg-richblack-800"></div>
                <Link to="/dashboard/my-profile" className="rounded-lg py-2 px-3 hover:bg-richblack-700">
                  Dashboard
                </Link>
                {user.accountType === "Admin" && (
                  <Link to="/admin" className="rounded-lg py-2 px-3 hover:bg-richblack-700">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => {
                  dispatch(logout(navigate));
                  setMobileMenuOpen(false);
                }} className="rounded-lg py-2 px-3 hover:bg-richblack-700 text-left">
                  Logout
                </button>
              </div>
            </li>
          )}
        </ul>

        {/* Mobile menu - visible on small devices */}
        {mobileMenuOpen && (
          <div className="absolute top-14 left-0 z-50 w-full bg-richblack-900 p-4 sm:hidden">
            <ul className="flex flex-col gap-4 text-white">
              {NavbarLinks.map((link, index) => (
                <li key={index}>
                  {link.title === "Catalog" ? (
                    <details>
                      <summary className="cursor-pointer rounded-xl p-2 hover:bg-richblack-800">
                        Catalog
                      </summary>
                      <div className="mt-2 flex flex-col gap-2 pl-4">
                        {loading ? (
                          <p>Loading...</p>
                        ) : subLinks.length ? (
                          subLinks.map((subLink, i) => (
                            <Link
                              key={i}
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="rounded-lg py-2 px-3 hover:bg-richblack-800"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subLink.name}
                            </Link>
                          ))
                        ) : (
                          <p>No Courses Found</p>
                        )}
                      </div>
                    </details>
                  ) : (
                    <Link
                      to={link?.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl p-2 hover:bg-richblack-800"
                    >
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}

              {/* Services for Mobile */}
              <details>
                <summary className="cursor-pointer rounded-xl p-2 hover:bg-richblack-800">
                  Services
                </summary>
                <div className="mt-2 flex flex-col gap-2 pl-4">
                  <Link
                    to="/services/institute"
                    className="rounded-lg py-2 px-3 hover:bg-richblack-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    For Institute
                  </Link>
                  <Link
                    to="/services/student"
                    className="rounded-lg py-2 px-3 hover:bg-richblack-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    For Student
                  </Link>
                </div>
              </details>

              {/* Auth Buttons for Mobile */}
              {!token && (
                <>
                  <li>
                    <button
                      onClick={handleLogin}
                      className="w-full text-left block rounded-xl p-2 hover:bg-richblack-800"
                    >
                      Log in
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleSignup}
                      className="w-full text-left block rounded-xl p-2 hover:bg-richblack-800"
                    >
                      Sign up
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
