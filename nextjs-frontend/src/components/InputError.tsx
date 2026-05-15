interface InputErrorProps {
  messages?: string[];
  className?: string;
}

export default function InputError({
  messages = [],
  className = "",
}: InputErrorProps) {
  if (messages.length === 0) return null;

  return (
    <div className={`mt-1 space-y-1 ${className}`}>
      {messages.map((message, index) => (
        <p key={index} className="text-xs text-red-500 font-medium ml-1">
          ※ {message}
        </p>
      ))}
    </div>
  );
}
