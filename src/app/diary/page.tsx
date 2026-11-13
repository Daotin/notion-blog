import Link from "next/link";
import { redirect } from "next/navigation";
import { getDiaryIndex, type DiaryIndex } from "@/lib/diary/data";
import { isLoggedIn } from "@/lib/diary/session";
import { DiaryApp } from "./diary-app";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());

export default async function DiaryPage() {
  if (!(await isLoggedIn())) redirect("/diary/login");
  let index: DiaryIndex;
  try {
    index = await getDiaryIndex();
  } catch (e) {
    console.error(e);
    return (
      <div className="diary">
        <div className="gate">
          <h1>日记</h1>
          <p>读取日记失败</p>
          <Link href="/diary">重试</Link>
        </div>
      </div>
    );
  }
  return (
    <DiaryApp
      days={index.days}
      problems={index.problems}
      today={today()}
      notionUrl={process.env.DIARY_NOTION_URL ?? null}
    />
  );
}
