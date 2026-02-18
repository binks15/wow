import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";


const GameIntrest = ({gameInterests , setSelectedGames ,selectedGames,updateGameInterests,onSaveInterests,interestMessage} :any) => {
  return (
    
      <Card>
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            Game interests
          </h3>
          <p className="text-sm text-slate-500">
            Only interested users can request or receive slots.
          </p>
        </div>

        {gameInterests.isLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <Spinner /> Loading interests...
          </div>
        ) : null}

        {gameInterests.isError ? (
          <p className="mt-4 text-sm text-red-600">
            Unable to load interests right now.
          </p>
        ) : null}

        {gameInterests.data ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {gameInterests.data.map((game:any) => (
              <label
                key={game.gameId}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedGames.includes(game.gameId)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectedGames((prev:any) => [...prev, game.gameId]);
                    } else {
                      setSelectedGames((prev:any) =>
                        prev.filter((id:any) => id !== game.gameId),
                      );
                    }
                  }}
                />
                <span className="font-medium text-slate-800">
                  {game.gameName}
                </span>
              </label>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            disabled={updateGameInterests.isPending}
            onClick={onSaveInterests}
          >
            {updateGameInterests.isPending ? "Saving..." : "Save interests"}
          </Button>
          {interestMessage ? (
            <span className="text-sm text-emerald-600">{interestMessage}</span>
          ) : null}
        </div>
      </Card>
  )
}

export default GameIntrest