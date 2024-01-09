import user from "@backend/models/user";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ImageUploading, { ImageListType } from 'react-images-uploading';
import AdminOnlyPage from "./AdminOnlyBanner";
import { Button, TextField } from "@mui/material";
import { Form, Formik } from "formik";
import MyTextField from "../inputs/myTextField";
import { useTournament, useUpdateTournament } from "../tournament/hooks";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { TTournament } from "@backend/models/tournament";

function CompleteTournament({ next, prev }) {
    const [images, setImages] = useState([] as ImageListType);

    const handleImageUpload = (images: ImageListType) => {
        setImages(images);
    }


    type ImageUploadData = {
        imageData: File,
        fileType: string,
        fileName?: string,
    }
    const uploadImage = useMutation({
        mutationFn: async ({ imageData, fileType, fileName }: ImageUploadData) => {
            const res = await axios.post(`/api/upload`, imageData, {
                headers: {
                    "Content-Type": fileType,
                    "Content-Disposition": `attachment; filename=${fileName}`,
                }
            });
            return res.data;
        }
    })

    const updateTournament = useUpdateTournament("current");

    type AlltimeEntry = {
        summary?: string,
        images: ImageListType,
    }
    const handleSubmit = async (values: AlltimeEntry) => {
        console.log(values)
        const img = values.images[0]?.file;

        //i don't like this conditional async stuff
        let name;
        if (img) {
            const res = await uploadImage.mutateAsync({
                imageData: img,
                fileType: img.type,
            });
            name = res.name;
        }

        updateTournament.mutate({
            summary: values.summary,
            images: [name]
        });

        next(); //set tournament state to complete
    }

    return <AdminOnlyPage>
        <Formik initialValues={{
            images: [],
            summary: ""
        }} onSubmit={handleSubmit}>
            {({ setFieldValue, values }) => {
                return <Form>
                    <ImageUploading value={values.images} onChange={(images) => setFieldValue("images", images)} dataURLKey="data_url">
                        {({
                            imageList,
                            onImageUpload,
                            onImageUpdate,
                            onImageRemove,
                            isDragging,
                            dragProps,
                        }) => (
                            <div className="upload__image-wrapper">
                                <button
                                    style={isDragging ? { color: 'red' } : undefined}
                                    onClick={onImageUpload}
                                    {...dragProps}
                                >
                                    Click or Drop here
                                </button>
                                {imageList.map((image, index) => (
                                    <div key={index} className="image-item">
                                        <img src={image['data_url']} alt="" width="400" />
                                        <div className="image-item__btn-wrapper">
                                            <button onClick={() => onImageUpdate(index)}>Update</button>
                                            <button onClick={() => onImageRemove(index)}>Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ImageUploading>
                    <MyTextField name="summary" multiline minRows={2}></MyTextField>
                    <Button type="submit">submit</Button>
                </Form>
            }}
        </Formik>
    </AdminOnlyPage>
}

export default CompleteTournament;