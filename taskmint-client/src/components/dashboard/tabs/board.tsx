import { Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const boardItems = Array.from({ length: 0 }).fill(0);

function Board() {
  return (
    <section className="space-y-6 py-4">
      <h1 className="text-3xl font-semibold">Boards</h1>

      <div>
        {boardItems.length ? (
          <p>board pinned tasks {boardItems.length}</p>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Presentation />
              </EmptyMedia>
              <EmptyTitle>No Tasks</EmptyTitle>
              <EmptyDescription>
                No tasks are pinned to the board at this time
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>Pin Tasks to Board</Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </section>
  );
}

export default Board;
