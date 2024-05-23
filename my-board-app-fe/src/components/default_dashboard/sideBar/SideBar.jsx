import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NewListModal from "./NewListModal";
import Modal from "../../Modal";
import Form from "../../populated_dashboard/form/Form"; // Import the Form component
import { Link } from "react-router-dom";
import logo from "../../../assets/images/add_task.png";
import List from "../../../assets/images/list-ul.png";
import Icon from "../../../assets/images/Icon.png";
import Delete from "../../../assets/images/Delete.png";
import Logout from "../../../assets/images/logout.png";
import {ApiQuery} from "../../../api-service/index.js";
import CalendarIcon from "../../../assets/images/icons8.png";

const SideBar = ({ selectedListId, setSelectedListId, fetchTasks }) => {
  const handleLogout = async () => {
    await ApiQuery.post("/auth/logout")
      .then((response) => {
        console.log(response);
        window.location.href = "/login";
      })
      .catch((error) => alert(error.message));
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [taskLists, setTaskLists] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);
  const [showDeleteAllSuccessMessage, setShowDeleteAllSuccessMessage] = useState(false);
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("token");
  const modalRef = useRef();

  useEffect(() => {
    let mounted = true;

    const fetchTaskLists = async () => {
      if (!accessToken) {
        console.error("No authentication token found");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:8080/api/v1/task-list/get-task-list/${userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (mounted) {
          setTaskLists(response.data);
        }
      } catch (error) {
        console.error("Error fetching task lists", error);
      }
    };

    fetchTaskLists();
    return () => {
      mounted = false;
    };
  }, [userId, accessToken]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setModalOpen(false);
        setSelectedList(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCreateTask = () => {
    if (selectedListId) {
      setModalOpen(true);
    } else {
      console.error("No list selected to create task");
    }
  };

  const [showForm, setShowForm] = useState(false);
  const ToggleFormModal = () => {
    setShowForm((showForm) => !showForm);
  };

  const handleDelete = (listId) => {
    setListToDelete(listId);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/task-list/delete-task-list/${listToDelete}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 200) {
        console.log("Task list deleted successfully");
        setTaskLists(taskLists.filter((list) => list.id !== listToDelete));
        setListToDelete(null);
        setShowDeleteConfirmation(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        console.error("Failed to delete task list");
      }
    } catch (error) {
      console.error("Error deleting task list:", error);
    }
  };


  const confirmDeleteAll = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/api/v1/task-list/delete-all-task-list/${userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.status === 200) {
        console.log("All task lists deleted successfully");
        setTaskLists(taskLists.filter((list) => list.id !== listToDelete));
        setListToDelete(null);
        setShowDeleteAllConfirmation(false);
        setShowDeleteAllSuccessMessage(true);
        setTimeout(() => setShowDeleteAllSuccessMessage(false), 3000);
      } else {
        console.error("Failed to delete all task lists");
      }
    } catch (error) {
      console.error("Error deleting all task lists:", error);
    }
  };


  const handleDeleteAllTaskLists = (listId) => {
    setListToDelete(listId);
    setShowDeleteAllConfirmation(true);
  };


  return (
    <div className="w-[225px]">
      <div className="bg-[#175CD3] h-screen overflow-y-auto">
        <div className="flex gap-3 pt-8 pl-10">
          <img className="w-[40] h-[40]" src={logo} alt="" />
          <h1 className="font-sans font-normal text-xl leading-7 text-white pt-1.5">
            My Board
          </h1>
        </div>
        <div className="mt-16 ml-7">
          {taskLists.map((list) => (
            <div key={list.id} className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedList(list);
                  setSelectedListId(list.id);
                }}
              >
                <img src={List} alt="" />
              </button>
              <button
                onClick={() => {
                  fetchTasks(list.id);
                }}
              >
                <p className="text-white text-xl">{list.title}</p>
              </button>
              {selectedList && selectedList.id === list.id && (
                <div
                  className="absolute bg-white shadow-lg rounded-lg p-2 ml-[80px]"
                  ref={modalRef}
                >
                  <button onClick={ToggleFormModal}>Create Task</button>
                  <br />
                  <button onClick={() => setModalOpen(true)}>Edit List</button>
                  <br />
                  <button onClick={() => handleDelete(list.id)}>
                    Delete List
                  </button>
                </div>
              )}
            </div>
          ))}
          </div>
          <div className="mt-[10px] w-[133px]  p-[10px 20px 10px 0px] gap-[10px] bg-[#FFFFFF] ml-8 rounded-xl text-[#175CD3]">
          <div className="flex gap-2 ml-2">
            <img src={Icon} alt="" className="w-[18px] h-[10px] mt-3" />
            <Link to="#" onClick={() => setModalOpen(true)} className="mt-2">
              New List
            </Link>
          </div>

        
          <div className="flex gap-2 mt-[0.75rem] ml-2">
          <img src={Delete} alt="" className="w-[14px] h-[18px]" />
          <Link to="#" onClick={handleDeleteAllTaskLists}>
            Delete All List
          </Link>
          </div>
          {showSuccessMessage && (
          <div className="absolute bottom-10 left-0 right-0 flex ml-[720px]">
          </div>
          )}
          
          

          <div className="flex gap-2 mt-[0.75rem] ml-2">
            <img src={CalendarIcon} alt="" className="w-[20px] h-[22px]" />
            <Link to="/scheduler">Calendar</Link>
          </div>
          <div className="flex gap-2 mt-[0.75rem] ml-2">
            <img src={Logout} alt="" />
            <Link to="#" onClick={handleLogout}>
              Logout
            </Link>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <NewListModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedList(null);
          }}
          listId={selectedList && selectedList.id}
          initialTitle={selectedList && selectedList.title}
          initialDescription={selectedList && selectedList.description}
        />
      )}
      {showForm && (
        <Modal children={<Form className="z-50" hideModal={ToggleFormModal} />} />
      )}
      {showDeleteConfirmation && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0000004d] bg-opacity-75 z-50">
          <div className="bg-white rounded-lg w-[598px]">
            <div className="bg-blue-700 h-[71px] text-white px-4 py-3 flex justify-between items-center rounded-t-[10px]">
              <h3 className="text-[20px] ">Delete List?</h3>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-[#545860] px-4 py-6">
              <p>Are you sure you want to delete this List?</p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="pl-[21rem]  bg-white text-[#175CD3] rounded-md"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md mr-4"
                >
                  YES, DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllConfirmation && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#0000004d] bg-opacity-75 z-50">
          <div className="bg-white rounded-lg w-[598px]">
            <div className="bg-blue-700 h-[71px] text-white px-4 py-3 flex justify-between items-center rounded-t-[10px]">
              <h3 className="text-[20px] ">Delete All Task Lists?</h3>
              <button
                onClick={() => setShowDeleteAllConfirmation(false)}
                className="text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="text-[#545860] px-4 py-6">
              <p>Are you sure you want to delete all Task Lists?</p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowDeleteAllConfirmation(false)}
                  className="pl-[21rem]  bg-white text-[#175CD3] rounded-md"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDeleteAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-md mr-4"
                >
                  YES, DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {showSuccessMessage && (
        <div className="absolute bottom-10 left-0 right-0 flex ml-[720px]">
          <div className="bg-blue-500 text-white py-2 px-4 rounded-md">
            List deleted successfully!
          </div>
        </div>
      )}

      {showDeleteAllSuccessMessage && (
            <div className="absolute bottom-10 left-0 right-0 flex ml-[720px]">
              <div className="bg-blue-500 text-white py-2 px-4 rounded-md">
                All task lists deleted successfully!
              </div>
            </div>
          )}

    </div>
  );
};

export default SideBar;
