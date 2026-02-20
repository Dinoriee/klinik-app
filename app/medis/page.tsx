import { AuthOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"


const DashboardMedis = async () => {
    const session = await getServerSession(AuthOptions);
    console.log(session);

    return(
        <div>
            Selamat datang {session?.user?.name}
        </div>
    )
}

export default DashboardMedis