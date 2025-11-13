import Link from "next/link";
import Image from "next/image";
import Container from "../container/container";

export default function Footer() {
    return (
        <footer className="bg-[#000150]">
            <Container className="py-[39.5px]">
                <div className="">
                    <div className="min-w-[100px] w-[135px]">
                        <Link href={"/"}>
                            <Image
                                src="/footer-logo.svg"
                                alt="ToProject"
                                width={135}
                                height={43}
                                className="w-full h-auto"
                            />
                        </Link>
                    </div>
                    <p className="text-white text-[14px] py-[10.5px]">&copy; 2025, Все права защищены</p>
                </div>
            </Container>
        </footer>
    )
}