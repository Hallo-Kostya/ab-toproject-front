import Image from "next/image";
import { formatShortName } from "@/utils/formatName";
import { User } from "@/types/users/user";

interface UserMenuProps {
    user: User,
}

export default function UserMenu({ user }: UserMenuProps) {
    const displayName = formatShortName(user.firstName, user.lastName);

    return (
        <div className="flex gap-[6px] items-center min-w-[100px]">
            <div className="user-info py-[5px] flex flex-col">
                <p className="whitespace-nowrap text-[#000150] text-[13.5px] font-semibold">{displayName}</p>
                <button className="logout-btn text-[#333333] text-[10.5px] text-right">
                    Выход
                </button>
            </div>
            <div className="min-w-[32px] w-[39px]">
                <Image
                    src="/default_avatar.jpg"
                    alt={`${displayName} avatar`}
                    width={39}
                    height={39}
                    className="w-full h-auto rounded-full"
                />
            </div>
        </div>
    )
}