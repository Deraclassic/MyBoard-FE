import React, { useState, useEffect } from "react";
import UserNameIcon from "../header/UserNameIcon";
import axios from "axios";

const EditUserModal = ({ isOpen, toggleModal, updateUser }) => {
  const [userName, setUserName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userIcon, setUserIcon] = useState(
    localStorage.getItem("userIcon") || ""
  );
  const accessToken = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      const userId = localStorage.getItem("userId");
      const fetchUserDetails = async () => {
        if (!accessToken) {
          console.error("No authentication token found");
          return;
        }
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          };
          const response = await axios.get(
            `http://localhost:8080/api/v1/user/${userId}`,
            config
          );
          const { firstName, lastName, email, phoneNumber } = response.data;
          setUserName(firstName);
          setLastName(lastName);
          setEmail(email);
          setPhoneNumber(phoneNumber);
        } catch (error) {
          console.error("Failed to fetch user details", error);
          // Handle 403 specifically, if needed
          if (error.response && error.response.status === 403) {
            console.error(
              "Access denied. You do not have permission to access this resource."
            );
          }
        }
      };

      fetchUserDetails();
    }
  }, [isOpen, accessToken]); // Include accessToken in the dependency array

  const handleUpdate = async () => {
    if (!accessToken) {
      console.error("No authentication token found");
      return;
    }
    const userId = localStorage.getItem("userId");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      };
      const userData = {
        firstName: userName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber,
      };
      const response = await axios.put(
        `http://localhost:8080/api/v1/user/${userId}/edit-user`,
        userData,
        config
      );
      console.log("Update successful", response.data);
      localStorage.setItem("userName", `${userName} ${lastName}`);
      localStorage.setItem("userIcon", userIcon);
      updateUser(userName, userIcon);
      toggleModal();
    } catch (error) {
      console.error("Failed to update user details", error);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.currentTarget === event.target) {
      toggleModal();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white w-[700px] h-[525px] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-blue-700 text-white p-4 rounded-t-lg">
          Edit User Information
        </div>
        <div className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-left items-center space-x-4">
              <UserNameIcon className="w-24 h-24" fontSize="text-6xl" />
              <ul>
                <p>Full Name: {`${userName} ${lastName}`}</p>
                <p>Email Address: {email}</p>
                <p>Phone Number: {phoneNumber}</p>
              </ul>
            </div>
            <div>
              <label htmlFor="userName">First Name:</label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="border border-gray-300 p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="lastName">Last Name:</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border border-gray-300 p-2 w-full"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber">Phone Number:</label>
              <input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="border border-gray-300 p-2 w-full"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4 p-4">
          <button
            onClick={toggleModal}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;