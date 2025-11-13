import { promises as fs } from "fs";
import path from "path";

export type TaskStatuses = Record<string, boolean>;

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "lib",
  "data",
  "roadmap-status.json"
);

const ensureFileExists = async () => {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      await fs.writeFile(DATA_FILE_PATH, "{}", "utf-8");
    } else {
      throw error;
    }
  }
};

const readStatuses = async (): Promise<TaskStatuses> => {
  await ensureFileExists();
  const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");

  try {
    const parsed = JSON.parse(fileContent) as TaskStatuses;
    return parsed ?? {};
  } catch (error) {
    console.error("Failed to parse roadmap status data. Resetting file.", error);
    await fs.writeFile(DATA_FILE_PATH, "{}", "utf-8");
    return {};
  }
};

const writeStatuses = async (statuses: TaskStatuses) => {
  await fs.writeFile(
    DATA_FILE_PATH,
    JSON.stringify(statuses, null, 2),
    "utf-8"
  );
};

export const getTaskStatuses = async (): Promise<TaskStatuses> => {
  return readStatuses();
};

export const toggleTaskStatus = async (
  key: string
): Promise<{ status: boolean }> => {
  const statuses = await readStatuses();
  const currentStatus = statuses[key];
  const nextStatus = currentStatus === undefined ? false : !currentStatus;
  statuses[key] = nextStatus;
  await writeStatuses(statuses);
  return { status: nextStatus };
};

