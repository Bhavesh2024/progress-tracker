import React from "react";
import { motion } from "framer-motion";
type Props = {
	isPending: boolean;
	isError: boolean;
	message: string;
	open: boolean;
};
const MessageModal: React.FC<Props> = ({
	open,
	isPending = false,
	isError,
	message,
}) => {
	return (
		<>
			{open && !isPending && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className={`p-3 w-full md:w-10/12 lg:w-2/3 rounded-md text-center ${
						isError ? "bg-red-300" : "bg-emerald-300"
					}`}>
					{message}
				</motion.div>
			)}
		</>
	);
};

export default MessageModal;
