import React, { useEffect, useState } from 'react'
import Table from './table'
import Modal from './modal';
import useAuthStore from '../../../../services/stores/authStore';
import useUsersStore from '../../../../services/stores/users/users';

const AddNewUser = () => {
    const { token } = useAuthStore();
    const { getUsers, data } = useUsersStore();
    const [toggleAdd, setToggleAdd] = useState(false);
    const [ usersData, setUsersData ] = useState([])
    const [newUser, setNewUser] = useState({
        firstname: "",
        middlename: "",
        lastname: "",
        email: "",
        password: "",
        role: "STAFF"
    });

    useEffect(() => {
        if (token) {
            getUsers(token);
        }

    }, [token]);

    useEffect(() => {
        if(data) {
            setUsersData(data)
        }
    }, [data]);

    return (
        <>
            <div className='container'>
                <div className="flex flex-col gap-5 pt-4">
                    <div className=''>
                        <h2 className='text-xl text-[#4154F1]'>Add new user</h2>
                        <p className='text-sm text-[#989797]'>Users / {toggleAdd && "Add new user"}</p>
                    </div>
                    <div>
                        <Table data={usersData} toggleAdd={setToggleAdd} />
                    </div>
                </div>
            </div>
            <Modal isOpen={toggleAdd} setIsOpen={setToggleAdd} setUserData={setNewUser} userData={newUser} setUsersData={setUsersData} />
        </>
    )
}

export default AddNewUser