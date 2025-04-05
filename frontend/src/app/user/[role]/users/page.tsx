"use client";

import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import UserForm from "@/components/form/UserForm";
import Alert from "@/components/modal/alert/Alert";
import Modal from "@/components/modal/Modal";
import { deleteUser, useGetAllUser } from "@/services/userApi";
import dotenv from "dotenv";
import ViewUser from "@/components/modal/view/ViewUser";
import { useUserStore } from "@/hooks/useUserStore";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Column } from "primereact/column";
import Image from "next/image";
dotenv.config();

const User = () => {
	const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
	const [openFormModal, setOpenFormModal] = useState<boolean>(false);
	const [formAction, setFormAction] = useState<string>("");
	const [id, setId] = useState<string>("");
	const [currentUser, setCurrentUser] = useState(null);
	const [index, setIndex] = useState<string>("");
	const [openViewModal, setOpenViewModal] = useState<boolean>(false);
	const { users, addNewUser, removeUser, clearAllUsers } = useUserStore();
	const [filters, setFilters] = useState({
		"user.name": {
			value: null,
			matchMode: FilterMatchMode.STARTS_WITH,
		},
	});
	const [searchValue, setSearchValue] = useState<string>("");
	// Mutation hook for deleting a user
	const {
		mutate: deleteUserMutation,
		isError: deleteError,
		isSuccess: deleteSuccess,
		isPending: pendingDelete,
	} = useMutation({
		mutationFn: deleteUser,
		onSuccess: (data) => {
			console.log("user deleted successfully");
			console.log(data);
			removeUser(data.id);
		},
		onError: (err) => {
			console.log(err.message);
		},
	});

	const {
		data: allUsers,
		isLoading: loadingUsers,
		isError: usersError,
		isSuccess: usersSuccess,
	} = useGetAllUser();

	const tableColumn = [
		{
			field: "empCode",
			header: "EMPLOYEE ID",
		},
		{
			field: "profilePhoto",
			header: "Profile",
		},
		{
			field: "name",
			header: "Name",
		},
		{
			field: "username",
			header: "Username",
		},
		{
			field: "birthDate",
			header: "Birth Date",
		},
		{
			field: "gender",
			header: "Gender",
		},
		{
			field: "email",
			header: "Email",
		},
		{
			field: "phone",
			header: "Phone",
		},
		{
			field: "jobRole",
			header: "Job Role",
		},
		{
			field: "role",
			header: "Role",
		},
		{
			field: "joiningDate",
			header: "Joining Date",
		},
		{
			field: "view",
			header: "View",
		},
		{
			field: "update",
			header: "Update",
		},
		{
			field: "delete",
			header: "Delete",
		},
	];

	const handleDelete = (id: string) => {
		console.log("hello");
		setId(id);
		setOpenDeleteModal(true);
	};

	const handleDeleteUser = async (id: string) => {
		try {
			deleteUserMutation(id);
		} catch (err) {
			if (err instanceof Error) {
				console.log(err.message);
			}
		}
	};

	const handleFormModal = (
		action: string,
		id: string = "",
		data: any | null = null,
	) => {
		if (id !== "") {
			if (data !== null) {
				setCurrentUser(data);
			}

			formAction == "edit"
				? setOpenFormModal(true)
				: setFormAction("edit");
			setId(id);
		} else {
			setCurrentUser(null);
			formAction == "add"
				? setOpenFormModal(true)
				: setFormAction("add");
		}
	};

	const handleViewModal = (data: any) => {
		if (data) {
			setCurrentUser(data);
			setOpenViewModal(true);
		}
	};

	const paginatorTemplate = (options: any) => {
		return (
			<div className='custom-paginator-wrapper'>
				{/* First and Last Page buttons */}
				<button
					onClick={() =>
						options.onPageChange({
							first: 0,
							rows: options.rows,
						})
					}>
					First
				</button>
				<button
					onClick={() =>
						options.onPageChange({
							first: options.first - options.rows,
							rows: options.rows,
						})
					}>
					Prev
				</button>

				{/* Page Info */}
				<span className='page-info'>
					{`Page ${
						Math.floor(options.first / options.rows) + 1
					} of ${Math.ceil(users.length / options.rows)}`}
				</span>

				{/* Next and Last Page buttons */}
				<button
					onClick={() =>
						options.onPageChange({
							first: options.first + options.rows,
							rows: options.rows,
						})
					}>
					Next
				</button>
				<button
					onClick={() =>
						options.onPageChange({
							first:
								(Math.ceil(
									users.length /
										options.rows,
								) -
									1) *
								options.rows,
							rows: options.rows,
						})
					}>
					Last
				</button>

				{/* Rows per page selection */}
				<select
					onChange={(e) =>
						options.onPageChange({
							first: 0,
							rows: e.target.value,
						})
					}>
					<option value={5}>5</option>
					<option value={10}>10</option>
					<option value={20}>20</option>
				</select>
			</div>
		);
	};

	useEffect(() => {
		if (formAction == "add" || formAction == "edit") {
			setOpenFormModal(true);
		}
	}, [formAction]);

	useEffect(() => {
		if (users.length == 0) {
			if (allUsers && Array.isArray(allUsers.users)) {
				allUsers.users.forEach((user: any) => {
					addNewUser(user);
				});
			}
		}
	}, [allUsers]);
	useEffect(() => {
		console.log(users);
	}, [users]);

	// useEffect(() => {
	// 	return () => {
	// 		clearAllUsers();
	// 	};
	// }, []);

	return (
		<>
			{!loadingUsers && (
				<div className='flex flex-col gap-3 items-center mt-[70px] h-[90vh] justify-center w-full overflow-auto'>
					<div className='flex justify-between w-full md:w-10/12   '>
						<h1 className='text-xl font-semibold font-sans hidden md:block'>
							User
						</h1>
						<div className='flex flex-nowrap gap-3 w-11/12 mx-auto md:m-0 md:w-auto mt-10 md:mt-0'>
							<input
								type='search'
								placeholder='Search Users..'
								className='border border-slate-300 w-2/3  mx-auto md:w-auto rounded-md px-2 focus:outline-sky-200'
								onChange={(e) =>
									setSearchValue(
										e.target.value,
									)
								}
							/>
							<button
								type='button'
								className='bg-sky-600 rounded-md shadow min-w-24 h-10 text-white flex items-center justify-center'
								onClick={() =>
									handleFormModal("add")
								}>
								<Plus /> Add
							</button>
						</div>
					</div>
					<div className='w-11/12 md:max-w-10/12 overflow-x-auto '>
						<DataTable
							value={users}
							paginator
							globalFilter={searchValue}
							rows={10}
							rowsPerPageOptions={[
								2, 5, 10, 15, 20, 50, 100,
							]}
							size='small'
							className='responsive-datatable relative'
							paginatorClassName='responsive-paginator'>
							<Column
								field={"empCode"}
								header={"Id"}
								sortable
							/>
							<Column
								field={"profilePhoto"}
								header={"Profile"}
								body={(user) => (
									<Image
										src={
											user.profilePhoto !==
											""
												? `${process.env.NEXT_PUBLIC_SERVER_URL}/uploads/user/${user.profilePhoto}`
												: "/images/user.png"
										}
										className={
											"rounded-full h-12 w-12 object-cover shadow-lg bg-slate-300"
										}
										alt='User Image'
										title={user.name}
										height={50}
										width={50}
									/>
								)}
							/>
							<Column
								field={"name"}
								header={"Name"}
								sortable
							/>
							<Column
								field={"username"}
								header={"Username"}
							/>
							<Column
								field={"birthDate"}
								body={(rowData) =>
									rowData.birthDate
										? rowData.birthDate.split(
												"T",
										  )[0]
										: "-"
								}
								header={"Birth Date"}
								sortable
							/>
							<Column
								field={"gender"}
								header={"Gender"}
								sortable
							/>
							<Column
								field={"email"}
								header={"Email"}
							/>
							<Column
								field={"phone"}
								header={"Phone"}
							/>
							<Column
								field={"role"}
								header={"Role"}
								className='capitalize'
							/>
							<Column
								field={"jobRole"}
								header={"Job Role"}
							/>
							<Column
								field='joiningDate'
								header={"Joining Date"}
								body={(data) =>
									data.joiningDate
										? data.joiningDate.split(
												"T",
										  )[0]
										: "-"
								}
							/>
							<Column
								body={(user) => (
									<Eye
										className='mx-auto  flex cursor-pointer text-sky-500 '
										onClick={() =>
											handleViewModal(
												user,
											)
										}
									/>
								)}
								header='View'
							/>
							<Column
								body={(user) => (
									<Edit
										className='mx-auto  flex cursor-pointer text-emerald-500 '
										onClick={() =>
											handleFormModal(
												"edit",
												user.id,
												user,
											)
										}
									/>
								)}
								header='Edit'
							/>
							<Column
								body={(user) => (
									<Trash2
										className='cursor-pointer text-red-500 mx-auto  flex '
										onClick={() =>
											handleDelete(
												user.id,
											)
										}
									/>
								)}
								header={"Delete"}
							/>
						</DataTable>
					</div>
				</div>
			)}

			{/* Delete Modal */}
			<Modal
				open={openDeleteModal}
				setOpen={setOpenDeleteModal}>
				<Alert
					open={openDeleteModal}
					title='Delete'
					setOpen={setOpenDeleteModal}
					message='Are You Sure to Delete User ?'
					positiveAction={() => handleDeleteUser(id)}
					isSuccess={deleteSuccess}
					isError={deleteError}
					isLoading={pendingDelete}
					successMessage='User Deleted Successfully'
					errMessage='User Not Deleted'
				/>
			</Modal>

			{/* Form Modal */}
			<Modal
				open={openFormModal}
				setOpen={setOpenFormModal}>
				<UserForm
					open={openFormModal}
					setOpen={setOpenFormModal}
					formTitle={
						formAction === "add"
							? "Add User"
							: "Edit User"
					}
					action={formAction}
					data={currentUser}
				/>
			</Modal>
			<Modal
				open={openViewModal}
				setOpen={setOpenViewModal}>
				<ViewUser
					setOpen={setOpenViewModal}
					open={openFormModal}
					data={currentUser}
				/>
			</Modal>
		</>
	);
};

export default User;
