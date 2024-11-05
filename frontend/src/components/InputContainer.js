import { FaArrowAltCircleUp } from "react-icons/fa";

export function InputContainer({handleSubmit, query, handleQuery}) {
  return (
    <form className="inputContainer" onSubmit={handleSubmit}>
      <textarea id="queryArea" name="queryArea" value={query} onChange={handleQuery} placeholder="Type a message"></textarea>
      <button type="submit"><FaArrowAltCircleUp /></button>
  </form>
  );
}
