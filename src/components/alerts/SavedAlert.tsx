function SavedAlert() {
    return (
        <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
        >
            <strong>Success!</strong> Your changes have been saved.
            <button
                type="button"
                className="btn-close"
                data-bs-dismiss="alert"
                aria-label="Close"
            ></button>
        </div>
    );
}

export default SavedAlert;
