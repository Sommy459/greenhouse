import { ImSpinner2 } from "react-icons/im";

const BtnLoader = () => {
  return (
    <div className="animate-spin duration-50 scale-y-[-1.5] scale-x-[1.5]">
      <ImSpinner2 className="mx-auto w-20 h-20" />
    </div>
  );
};

export default BtnLoader;
