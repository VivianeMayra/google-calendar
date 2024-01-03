import { Button, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react"
import { ArrowRight } from "phosphor-react"

import { Container, Form, FormAnnotation, Header } from "./styles"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { api } from "@/lib/axios"
import { AxiosError } from "axios"

const RegisterFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "O usuário precisa ter pelo menos 3 caracteres" })
    .regex(/^([a-z\\-]+)$/i, {
      message: "O usuário pode ter apenas letras e hifens.",
    })
    .transform((username) => username.toLowerCase()),

  name: z
    .string()
    .min(10, { message: "O nome precisa ter pelo menos 10 caracteres" })
    .regex(/^([a-zA-Z\s]+)$/, {
      message: "O nome pode ter apenas letras.",
    })
    .transform((name) => name.toLowerCase()),
})

type RegisterFormData = z.infer<typeof RegisterFormSchema>

export default function Register() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
  })

  const router = useRouter()

  useEffect(() => {
    if (router.query.username) {
      setValue("username", String(router.query.username))
    }
  }, [router.query?.username, setValue])

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post("/users", {
        name: data.name,
        username: data.username,
      })

      await router.push("/register/connect-calendar")
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        alert(err.response.data.message)
        return
      }

      console.error(err)
    }
  }
  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="calendar.com/"
            placeholder="seu-usuário"
            {...register("username")}
          />
          <FormAnnotation>
            <Text size="sm">
              {errors.username ? errors.username.message : ""}
            </Text>
          </FormAnnotation>
        </label>

        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu nome" {...register("name")} />
          <FormAnnotation>
            <Text size="sm">{errors.name ? errors.name.message : ""}</Text>
          </FormAnnotation>
        </label>

        <Button type="submit" desabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </Form>
    </Container>
  )
}
