import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const notificationData = [
  {
    id: 1,
    title: "Welcome",
    description:
      "Welcome to taskmint, get ready for a transformative task management experience.",
  },
  {
    id: 2,
    title: "New Features",
    description:
      "Check out the new features we've added to improve your workflow.",
  },
  {
    id: 3,
    title: "Updates",
    description:
      "We've made some updates to enhance performance and usability.",
  },
];

function Notifications() {
  return (
    <div>
      <NotificationsList />
    </div>
  );
}

function NotificationsList() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {notificationData.map((notification) => (
        <NotificationCard key={notification.id} {...notification} />
      ))}
    </div>
  );
}

function NotificationCard({
  title,
  description,
}: Pick<(typeof notificationData)[number], "title" | "description">) {
  return (
    <Card className="cursor-pointer py-4">
      <CardHeader className="px-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="truncate">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default Notifications;
