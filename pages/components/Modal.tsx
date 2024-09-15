import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
}

// Styled Components for the Modal Box and Button
const ModalBox = styled(Box)({
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
  borderRadius: "16px",
  padding: "20px",
  width: "400px",
  textAlign: "center",
  transition: "all 0.3s ease-in-out",
});

const ModalButton = styled(Button)({
  backgroundColor: "#ff0000",
  color: "#fff",
  padding: "10px 20px",
  borderRadius: "30px",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "1px",
  transition: "background-color 0.3s ease",

  "&:hover": {
    backgroundColor: "#cc0000",
  },
});

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Proceed",
}) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalBox>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", marginBottom: "16px" }}
        >
          {title}
        </Typography>

        <Typography sx={{ marginBottom: "24px", color: "#555" }}>
          {description}
        </Typography>

        <Box
          sx={{ display: "flex", justifyContent: "space-between", gap: "10px" }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              flexGrow: 1,
              borderColor: "#ff0000",
              color: "#ff0000",
              borderRadius: "30px",
            }}
          >
            Cancel
          </Button>
          <ModalButton onClick={onConfirm} sx={{ flexGrow: 1 }}>
            {confirmLabel}
          </ModalButton>
        </Box>
      </ModalBox>
    </Modal>
  );
};
