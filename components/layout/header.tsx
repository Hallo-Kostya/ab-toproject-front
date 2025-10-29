import Image from "next/image";
import Link from "next/link";
import Container from "./container";
import UserMenu from "../ui/user-menu";
import { users } from "@/mocks/users";

export default function Header() {
    return (
        <header className="bg-[#F4F3F3]">
        <Container className="py-[23px]">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="min-w-[100px] w-[135px]">
                    <Link href={"/"}>
                        <Image
                            src="/logo.svg"
                            alt="ToProject"
                            width={135}
                            height={43}
                            className="w-full h-auto"
                        />
                    </Link>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-[49px] min-w-0">
                    {/* SearchBar */}
                    <div className="min-w-[48px] w-[448px] h-[48px] bg-black/30 rounded">
                        {/* тут будет поиск */}
                    </div>

                    {/* Navigation */}
                    <nav>
                        <ul className="flex gap-[32px] flex-wrap justify-center md:justify-start">
                            <li>
                                <Link href={"/"} className="whitespace-nowrap">
                                    <span className="text-[#000150] text-[17px]">Проекты</span>
                                </Link>
                            </li>
                            <li>
                                <Link href={"/teams"} className="whitespace-nowrap">
                                    <span className="text-[#000150] text-[17px]">Команды</span>
                                </Link>
                            </li>
                            <li>
                                <Link href={"/on-review"} className="whitespace-nowrap">
                                    <span className="text-[#000150] text-[17px]">На рассмотрении</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* UserMenu */}
                    <UserMenu user={users[1]} />
                </div>
            </div>
        </Container>
        </header>
    );
}