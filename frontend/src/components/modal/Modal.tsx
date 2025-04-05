import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
	open: boolean;
	setOpen: (state: boolean) => void;
	children: ReactNode;
};

const Modal: React.FC<Props> = ({ open, setOpen, children }) => {
	if (!open) return null; // Prevents unnecessary rendering

	return createPortal(
		<div
			className='flex gap-1 p-4  justify-center min-h-screen max-h-screen overflow-auto w-full bg-neutral-800/40 fixed z-40 top-0 start-0'
			onClick={() => setOpen(false)}>
			<div
				onClick={(e) => e.stopPropagation()}
				className='w-full min-h-[90vh] flex items-center justify-center h-fit overflow-auto'>
				{children}
			</div>
		</div>,
		document.body,
	);
};

export default Modal;
