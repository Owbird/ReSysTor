export const Add = async (param1: number): Promise<boolean> => {

		const res = await fetch("http://localhost:3000/action?a=Add", {method:"POST", body: JSON.stringify({param1})})

		const data = (await res.json())

		return data

		}
export const Divide = async (param1: number): Promise<boolean> => {

		const res = await fetch("http://localhost:3000/action?a=Divide", {method:"POST", body: JSON.stringify({param1})})

		const data = (await res.json())

		return data

		}
export const GetCount = async (): Promise<number> => {

		const res = await fetch("http://localhost:3000/action?a=GetCount", {method:"POST", body: JSON.stringify({})})

		const data = (await res.json())

		return data

		}
export const Multiply = async (param1: number): Promise<boolean> => {

		const res = await fetch("http://localhost:3000/action?a=Multiply", {method:"POST", body: JSON.stringify({param1})})

		const data = (await res.json())

		return data

		}
export const Reset = async (): Promise<boolean> => {

		const res = await fetch("http://localhost:3000/action?a=Reset", {method:"POST", body: JSON.stringify({})})

		const data = (await res.json())

		return data

		}
export const Subtract = async (param1: number): Promise<boolean> => {

		const res = await fetch("http://localhost:3000/action?a=Subtract", {method:"POST", body: JSON.stringify({param1})})

		const data = (await res.json())

		return data

		}