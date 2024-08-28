import logo from "../assets/logo.svg"


export default function Content() {
    return (
        <>
        <div className="bg-[#101116] z-20">
            <div className="h-[220px] w-full flex justify-center">
                <div className="flex flex-col justify-end items-center gap-8 bg-[#101116] fixed top-0 pt-[30px] z-10 w-full pb-4">
                    <div>
                        <img src={logo} alt="Logo" className="w-[250px]" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <h2 className="font-bold text-6xl">AI ChatBot</h2>
                        <p className="w-7/12 text-center text-lg">
                            <span className="font-semibold text-[#ff9806]">DOT LABS Chatbot</span> is your virtual assistant, ready to assist you with your queries about our products, services, and company. Ask away!
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}