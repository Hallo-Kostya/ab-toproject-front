import Link from "next/link";
import Image from "next/image";
import Container from "../container/container";

export default function Footer() {
    return (
        <footer className="bg-[#000150] mt-auto">
            <Container className="py-[39.5px]">
                <div className="flex flex-col md:flex-row md:justify-between items-center">
                    <div className="min-w-[100px] w-[135px] mb-4 md:mb-0">
                        <Link href={"/projects"}>
                            <Image
                                src="/footer-logo.svg"
                                alt="ToProject"
                                width={135}
                                height={43}
                                className="w-full h-auto"
                            />
                        </Link>
                    </div>
                    <p className="text-white text-[14px] text-center md:text-left">
                        &copy; 2026, Все права защищены
                    </p>
                </div>
            </Container>
        </footer>
    )
}