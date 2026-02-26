import prisma from "@/lib/db"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox"

const FormPresensiMedis = async () => {
    const tenagaMedis = await prisma.tenaga_Medis.findMany();
    
    return (
        <form action="" className="space-y-4" onSubmit={handleSubmit}>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="name">Tenaga Medis</label>
                                <Combobox items={tenagaMedis}>
                                    <ComboboxInput placeholder="Pilih Tenaga Medis"/>
                                    <ComboboxContent>
                                        <ComboboxEmpty>Tenaga medis tidak ditemukan</ComboboxEmpty>
                                        <ComboboxList>
                                            {(item) => (
                                                <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="email">Email</label>
                                <input type="email" className="border rounded-md h-8 p-2" placeholder="Contoh: example@mail.com" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="password">Password</label>
                                <input type="text" className="border rounded-md h-8 p-2" placeholder="Masukkan password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                            </div>

                            <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
                            >
                                Submit
                            </button>
                        </div>
                        </form>
    )
}

export default FormPresensiMedis