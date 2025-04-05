import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Calendar } from "primereact/calendar";
import { X } from "lucide-react";

type Props = {
	data: any;
};

const TrackerHistory: React.FC<Props> = ({ data: history }) => {
	const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
	const [filteredData, setFilteredData] = useState<any>([]);

	// Ensure filteredData initializes with history when data is available
	useEffect(() => {
		if (history && history.length > 0) {
			setFilteredData(history);
		}
	}, [history]);

	const handleDateFilter = (e: any) => {
		const range = e.value;
		setSelectedDateRange(range);

		if (range && range.length === 2) {
			const [start, end] = range;
			const filtered = history.filter((row: any) => {
				const rowDate = new Date(row.createdAt);
				return rowDate >= start && rowDate <= end;
			});
			setFilteredData(filtered);
		} else {
			setFilteredData(history); // Reset to original data if no range is selected
		}
	};

	const indexBodyTemplate = (rowData: any, { rowIndex }: any) => {
		return rowIndex + 1;
	};

	return (
		<>
			<div className='flex w-11/12 my-4 mx-auto items-center justify-between'>
				<h1 className='text-xl text-slate-700 py-3 font-semibold'>
					History
				</h1>
				<div className='flex items-center gap-1 relative'>
					<Calendar
						value={selectedDateRange}
						onChange={handleDateFilter}
						selectionMode='range'
						showTime
						placeholder='Select Date & Time'
						dateFormat='yy-mm-dd'
						hourFormat='24'
						className='h-10 w-fit max-w-[80%] overflow-auto'
					/>
					<div
						className='absolute rounded-md flex items-center justify-center top-0 end-0 bg-slate-200 h-10 w-10 cursor-pointer'
						onClick={() => {
							setSelectedDateRange(null);
							setFilteredData(history);
						}}>
						<X className='size-5 text-slate-800' />
					</div>
				</div>
			</div>
			<DataTable
				value={filteredData}
				resizableColumns
				paginator
				size='small'
				rows={5}
				paginatorClassName='flex items-center max-w-screen overflow-x-auto'
				rowsPerPageOptions={[5, 10, 15, 20, 50, 75, 100]}
				className='w-11/12 mx-auto'>
				<Column
					field='id'
					header='Index'
					body={indexBodyTemplate}
				/>
				<Column
					field={"createdAt"}
					header={"Date"}
					sortable
					body={({ createdAt }) => (
						<span>{createdAt.split("T")[0]}</span>
					)}
				/>
				<Column
					field={"startTime"}
					header={"Start Time"}
					sortable
					body={({ startTime }) => (
						<span>
							{new Date(
								startTime,
							).toLocaleTimeString("en-IN", {
								timeZone: "Asia/Kolkata",
							})}
						</span>
					)}
				/>
				<Column
					field={"stopTime"}
					header={"Stop Time"}
					body={({ stopTime }) => (
						<span>
							{stopTime &&
								new Date(
									stopTime,
								).toLocaleTimeString("en-IN", {
									timeZone: "Asia/Kolkata",
								})}
						</span>
					)}
				/>
			</DataTable>
		</>
	);
};

export default TrackerHistory;
