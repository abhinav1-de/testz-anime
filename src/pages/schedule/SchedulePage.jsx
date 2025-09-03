import Schedule from "@/src/components/schedule/Schedule";

function SchedulePage() {
  return (
    <div className="max-w-[1600px] mx-auto flex flex-col mt-[64px] max-md:mt-[50px] px-4">
      <div className="w-full flex flex-col gap-y-8 mt-6">
        <div className="flex flex-col gap-y-2">
          <h1 className="font-bold text-3xl text-white max-[478px]:text-2xl">
            Anime Schedule
          </h1>
          <p className="text-crunchyroll-text-muted text-base max-[478px]:text-sm">
            Find out when your favorite anime episodes are airing
          </p>
        </div>
        <Schedule />
      </div>
    </div>
  );
}

export default SchedulePage;
