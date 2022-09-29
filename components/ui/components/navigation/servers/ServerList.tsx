import { DragEventHandler, useDragDropContext } from "@thisbeyond/solid-dnd";
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  createSortable,
  closestCenter,
} from "@thisbeyond/solid-dnd";
import { Server } from "revolt.js/dist/maps/Servers";
import { createSignal, For, Show } from "solid-js";
import { styled } from "solid-styled-components";
import { Link } from "@revolt/routing";
import { Avatar } from "../../design/atoms/display/Avatar";
import { Unreads, UserStatus } from "../../design/atoms/indicators";
import { BiRegularHome } from "solid-icons/bi";
import { InvisibleScrollContainer } from "../../common/ScrollContainers";

const ServerListBase = styled(InvisibleScrollContainer)`
  background: ${({ theme }) => theme!.colours["background"]};

  .sortable {
    width: 50px;
    height: 50px;
    display: grid;
    place-items: center;
  }

  .sortable.active {
    filter: brightness(0.3);
  }

  .sortable.transition {
    transition: 0.25s ease transform;
  }
`;

const Sortable = (props: { item: Server }) => {
  const sortable = createSortable(props.item._id);
  const [state] = useDragDropContext()!;
  return (
    <div
      use:sortable
      class="sortable"
      classList={{
        active: sortable.isActiveDraggable,
        transition: !!state.active.draggable,
      }}
    >
      <Show when={!sortable.isActiveDraggable}>
        <Link href={`/server/${props.item._id}`}>
          <Avatar
            size={42}
            src={props.item.generateIconURL({ max_side: 256 })}
            holepunch={props.item.isUnread() ? "top-right" : "none"}
            overlay={
              <>
                <Show when={props.item.isUnread()}>
                  <Unreads count={props.item.getMentions().length} unread />
                </Show>
              </>
            }
            fallback={props.item.name}
          />
        </Link>
      </Show>
    </div>
  );
};

interface Props {
  orderedServers: Server[];
  currentUser: Nullable<User>;
}

export const ServerList = ({ orderedServers, currentUser }: Props) => {
  const [activeItem, setActiveItem] = createSignal<string | null>(null);
  const ids = () => orderedServers.map(({ _id }) => _id);

  const onDragStart: DragEventHandler = ({ draggable }) =>
    setActiveItem(draggable.id as string);

  const onDragEnd: DragEventHandler = ({ draggable, droppable }) => {
    if (draggable && droppable) {
      const currentItems = ids();
      const fromIndex = currentItems.indexOf(draggable.id as string);
      const toIndex = currentItems.indexOf(droppable.id as string);
      if (fromIndex !== toIndex) {
        const updatedItems = currentItems.slice();
        updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
        // setItems(updatedItems);
        console.debug("update!");
      }
    }
  };

  return (
    <ServerListBase>
      <DragDropProvider
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        collisionDetector={closestCenter}
      >
        <DragDropSensors />
        <div class="column self-stretch">
          <SortableProvider ids={ids()}>
            {/* list header goes here */}
            <div class="sortable">
              <Link href="/">
                <Show when={currentUser != null}>
                  <Avatar
                    size={42}
                    src={currentUser!!.generateAvatarURL({ max_side: 256 })}
                    holepunch="top-right"
                    overlay={
                      <>
                        <UserStatus status={currentUser!!.status?.presence == null ? "Invisible" : currentUser!!.status?.presence} />
                      </>
                    }
                    fallback={currentUser!!.username}
                  />
                </Show>
              </Link>
            </div>
            <For each={orderedServers}>
              {(item) => <Sortable item={item} />}
            </For>
            {/* list footer goes here */}
          </SortableProvider>
        </div>
        <DragOverlay>
          <div class="sortable">{activeItem()}</div>
        </DragOverlay>
      </DragDropProvider>
    </ServerListBase>
  );
};
