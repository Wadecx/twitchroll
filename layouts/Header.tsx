import Link from "next/link";

const Header = () => {
  return (
    <section className="flex justify-between bg-secondary p-4 items-center">
      <div className="flex gap-2">
        <h2 className="text-primary font-medium uppercase">TwitchRoulette</h2>
      </div>

      <div className="">
        <input
          type="text"
          name=""
          id=""
          placeholder="Rechercher"
          className="p-2 bg-transparent border-gray-300 text-white"
        />
      </div>
    </section>
  );
};

export { Header };
